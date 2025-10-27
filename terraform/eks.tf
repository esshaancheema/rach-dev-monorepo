# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "${local.name_prefix}-eks"
  cluster_version = var.eks_cluster_version

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  cluster_endpoint_private_access = true

  # Cluster endpoint access
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]

  # EKS Managed Node Groups
  eks_managed_node_groups = {
    for name, config in var.eks_node_groups : name => {
      name           = "${local.name_prefix}-${name}"
      instance_types = config.instance_types
      capacity_type  = config.capacity_type

      min_size     = config.min_size
      max_size     = config.max_size
      desired_size = config.desired_size

      disk_size = config.disk_size
      
      labels = merge(config.labels, {
        Environment = var.environment
        NodeGroup   = name
      })

      dynamic "taints" {
        for_each = config.taints
        content {
          key    = taints.value.key
          value  = taints.value.value
          effect = taints.value.effect
        }
      }

      # Launch template configuration
      create_launch_template = true
      launch_template_name   = "${local.name_prefix}-${name}"
      
      # User data for additional setup
      pre_bootstrap_user_data = <<-EOT
        #!/bin/bash
        # Install additional packages
        yum update -y
        yum install -y amazon-cloudwatch-agent
        
        # Configure CloudWatch agent
        cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
        {
          "metrics": {
            "namespace": "EKS/Node",
            "metrics_collected": {
              "cpu": {
                "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
                "metrics_collection_interval": 60,
                "totalcpu": false
              },
              "disk": {
                "measurement": ["used_percent"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
              },
              "diskio": {
                "measurement": ["io_time"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
              },
              "mem": {
                "measurement": ["mem_used_percent"],
                "metrics_collection_interval": 60
              }
            }
          }
        }
        EOF
        
        # Start CloudWatch agent
        /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s
      EOT

      # Security group rules
      vpc_security_group_ids = [aws_security_group.eks_nodes.id]

      tags = merge(local.common_tags, {
        Name = "${local.name_prefix}-${name}-node-group"
      })
    }
  }

  # EKS Add-ons
  cluster_addons = {
    coredns = {
      most_recent = true
      configuration_values = jsonencode({
        computeType = "Fargate"
        # Ensure that the CoreDNS EKS add-on is removed from the default
        # fargate profile before applying the add-on
        tolerations = [
          {
            key    = "compute"
            value  = "fargate"
            effect = "NoSchedule"
          }
        ]
      })
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
      configuration_values = jsonencode({
        env = {
          # Reference docs https://docs.aws.amazon.com/eks/latest/userguide/cni-increase-ip-addresses.html
          ENABLE_PREFIX_DELEGATION = "true"
          WARM_PREFIX_TARGET       = "1"
        }
      })
    }
    aws-ebs-csi-driver = {
      most_recent = true
      service_account_role_arn = aws_iam_role.ebs_csi_driver.arn
    }
  }

  # Fargate profiles for system workloads
  fargate_profiles = {
    karpenter = {
      name = "karpenter"
      selectors = [
        {
          namespace = "karpenter"
        }
      ]
    }
    
    system = {
      name = "system"
      selectors = [
        {
          namespace = "kube-system"
          labels = {
            "app.kubernetes.io/name" = "aws-load-balancer-controller"
          }
        },
        {
          namespace = "kube-system"
          labels = {
            "app.kubernetes.io/name" = "external-dns"
          }
        }
      ]
    }
  }

  # aws-auth configmap
  manage_aws_auth_configmap = true

  aws_auth_roles = [
    {
      rolearn  = aws_iam_role.eks_admin.arn
      username = "admin"
      groups   = ["system:masters"]
    },
  ]

  aws_auth_users = [
    # Add specific IAM users who should have access to the cluster
  ]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-eks"
  })
}

# Security group for EKS nodes
resource "aws_security_group" "eks_nodes" {
  name_prefix = "${local.name_prefix}-eks-nodes"
  vpc_id      = module.vpc.vpc_id
  description = "Security group for EKS worker nodes"

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "SSH access from VPC"
  }

  # Allow all traffic within the security group
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
    description = "All traffic within security group"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-eks-nodes-sg"
  })
}

# IAM Role for EBS CSI Driver
resource "aws_iam_role" "ebs_csi_driver" {
  name = "${local.name_prefix}-ebs-csi-driver"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = module.eks.oidc_provider_arn
        }
        Condition = {
          StringEquals = {
            "${replace(module.eks.oidc_provider_arn, "/^arn:aws:iam::\\d+:oidc-provider\\//", "")}:sub" = "system:serviceaccount:kube-system:ebs-csi-controller-sa"
            "${replace(module.eks.oidc_provider_arn, "/^arn:aws:iam::\\d+:oidc-provider\\//", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "ebs_csi_driver" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/Amazon_EBS_CSI_DriverPolicy"
  role       = aws_iam_role.ebs_csi_driver.name
}

# IAM Role for EKS Admin
resource "aws_iam_role" "eks_admin" {
  name = "${local.name_prefix}-eks-admin"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = data.aws_caller_identity.current.arn
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "eks_admin_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_admin.name
}

# OIDC Provider for service accounts
data "tls_certificate" "eks" {
  url = module.eks.cluster_oidc_issuer_url
}

# CloudWatch Log Group for EKS
resource "aws_cloudwatch_log_group" "eks" {
  name              = "/aws/eks/${local.name_prefix}-eks/cluster"
  retention_in_days = var.log_retention_days

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-eks-logs"
  })
}