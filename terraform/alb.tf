# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.load_balancer.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = var.environment == "production" ? true : false
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  # Access logs
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "alb-logs"
    enabled = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-alb"
  })
}

# Target Groups for different services
resource "aws_lb_target_group" "web_main" {
  name     = "${local.name_prefix}-web-main"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = false
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-web-main-tg"
    Service = "web-main"
  })
}

resource "aws_lb_target_group" "dashboard" {
  name     = "${local.name_prefix}-dashboard"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-dashboard-tg"
    Service = "dashboard"
  })
}

resource "aws_lb_target_group" "admin" {
  name     = "${local.name_prefix}-admin"
  port     = 3002
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-admin-tg"
    Service = "admin"
  })
}

resource "aws_lb_target_group" "developer_portal" {
  name     = "${local.name_prefix}-dev-portal"
  port     = 3003
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-dev-portal-tg"
    Service = "developer-portal"
  })
}

resource "aws_lb_target_group" "auth_service" {
  name     = "${local.name_prefix}-auth-svc"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-auth-svc-tg"
    Service = "auth-service"
  })
}

resource "aws_lb_target_group" "project_service" {
  name     = "${local.name_prefix}-project-svc"
  port     = 4001
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-project-svc-tg"
    Service = "project-service"
  })
}

resource "aws_lb_target_group" "ai_service" {
  name     = "${local.name_prefix}-ai-svc"
  port     = 4002
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-ai-svc-tg"
    Service = "ai-service"
  })
}

resource "aws_lb_target_group" "billing_service" {
  name     = "${local.name_prefix}-billing-svc"
  port     = 4003
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-billing-svc-tg"
    Service = "billing-service"
  })
}

resource "aws_lb_target_group" "notification_service" {
  name     = "${local.name_prefix}-notif-svc"
  port     = 4004
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-notif-svc-tg"
    Service = "notification-service"
  })
}

resource "aws_lb_target_group" "analytics_service" {
  name     = "${local.name_prefix}-analytics-svc"
  port     = 4005
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-analytics-svc-tg"
    Service = "analytics-service"
  })
}

# HTTP Listener (redirects to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = local.common_tags
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.domain_name != "" ? aws_acm_certificate_validation.main[0].certificate_arn : aws_acm_certificate.self_signed[0].arn

  # Default action - return 404
  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }

  tags = local.common_tags
}

# Self-signed certificate for non-production environments
resource "aws_acm_certificate" "self_signed" {
  count           = var.domain_name == "" ? 1 : 0
  domain_name     = "localhost"
  validation_method = "EMAIL"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-self-signed-cert"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Listener Rules for routing traffic
resource "aws_lb_listener_rule" "web_main" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web_main.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? [var.domain_name] : ["localhost"]
    }
  }

  tags = local.common_tags
}

resource "aws_lb_listener_rule" "dashboard" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 101

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.dashboard.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? ["dashboard.${var.domain_name}"] : ["dashboard.localhost"]
    }
  }

  tags = local.common_tags
}

resource "aws_lb_listener_rule" "admin" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 102

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? ["admin.${var.domain_name}"] : ["admin.localhost"]
    }
  }

  tags = local.common_tags
}

resource "aws_lb_listener_rule" "developer_portal" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 103

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.developer_portal.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? ["developer.${var.domain_name}"] : ["developer.localhost"]
    }
  }

  tags = local.common_tags
}

# API routing based on path
resource "aws_lb_listener_rule" "auth_service" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.auth_service.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? ["api.${var.domain_name}"] : ["api.localhost"]
    }
  }

  condition {
    path_pattern {
      values = ["/auth/*", "/oauth/*", "/admin/auth/*"]
    }
  }

  tags = local.common_tags
}

resource "aws_lb_listener_rule" "project_service" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 201

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.project_service.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? ["api.${var.domain_name}"] : ["api.localhost"]
    }
  }

  condition {
    path_pattern {
      values = ["/projects/*", "/workspaces/*"]
    }
  }

  tags = local.common_tags
}

resource "aws_lb_listener_rule" "ai_service" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 202

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ai_service.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? ["api.${var.domain_name}"] : ["api.localhost"]
    }
  }

  condition {
    path_pattern {
      values = ["/ai/*", "/chat/*", "/completions/*"]
    }
  }

  tags = local.common_tags
}

resource "aws_lb_listener_rule" "billing_service" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 203

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.billing_service.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? ["api.${var.domain_name}"] : ["api.localhost"]
    }
  }

  condition {
    path_pattern {
      values = ["/billing/*", "/subscriptions/*", "/payments/*"]
    }
  }

  tags = local.common_tags
}

resource "aws_lb_listener_rule" "notification_service" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 204

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.notification_service.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? ["api.${var.domain_name}"] : ["api.localhost"]
    }
  }

  condition {
    path_pattern {
      values = ["/notifications/*", "/email/*", "/sms/*"]
    }
  }

  tags = local.common_tags
}

resource "aws_lb_listener_rule" "analytics_service" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 205

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.analytics_service.arn
  }

  condition {
    host_header {
      values = var.domain_name != "" ? ["api.${var.domain_name}"] : ["api.localhost"]
    }
  }

  condition {
    path_pattern {
      values = ["/analytics/*", "/metrics/*", "/events/*"]
    }
  }

  tags = local.common_tags
}