import { motion } from 'framer-motion';
import { 
  BoltIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ClockIcon,
  CpuChipIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const advantages = [
  {
    icon: BoltIcon,
    title: '10x Development Speed',
    description: 'Our AI-accelerated approach delivers applications in hours, not months. Traditional development takes 3-6 months; we do it in days.',
    stats: '85% faster delivery',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    icon: CpuChipIcon,
    title: 'AI + Human Expertise',
    description: 'Perfect blend of artificial intelligence efficiency and human creativity. AI handles repetitive tasks while experts focus on innovation.',
    stats: '99.5% code accuracy',
    color: 'from-blue-400 to-purple-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise-Grade Security',
    description: 'Built-in security features, compliance standards, and robust architecture. Your data and applications are protected from day one.',
    stats: 'SOC 2 + ISO 27001',
    color: 'from-green-400 to-emerald-500'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Team, Local Service',
    description: 'Experienced developers across 25+ countries providing 24/7 support with local market understanding.',
    stats: '25+ countries',
    color: 'from-indigo-400 to-blue-500'
  },
  {
    icon: ClockIcon,
    title: '24/7 Continuous Development',
    description: 'Round-the-clock development cycle with teams across time zones. Your project never sleeps.',
    stats: '99.9% uptime',
    color: 'from-purple-400 to-pink-500'
  },
  {
    icon: UserGroupIcon,
    title: 'Dedicated Team Model',
    description: 'Get a dedicated team that becomes an extension of your organization. Deep understanding of your business goals.',
    stats: '4.9/5 satisfaction',
    color: 'from-pink-400 to-red-500'
  }
];

const achievements = [
  {
    icon: TrophyIcon,
    number: '500+',
    label: 'Projects Delivered',
    description: 'Successfully completed across industries'
  },
  {
    icon: SparklesIcon,
    number: '95%',
    label: 'Client Retention',
    description: 'Long-term partnerships built on trust'
  },
  {
    icon: BoltIcon,
    number: '3 Days',
    label: 'Average MVP Time',
    description: 'From concept to working prototype'
  },
  {
    icon: GlobeAltIcon,
    number: '25+',
    label: 'Countries Served',
    description: 'Global reach with local expertise'
  }
];

export default function WhyChooseZoptal() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Why Choose Zoptal</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            Why Leading Companies
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Choose Us
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            We don't just build software—we accelerate your entire development lifecycle 
            with AI-powered efficiency and human expertise.
          </motion.p>
        </div>

        {/* Advantages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 group hover:border-primary-200"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${advantage.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <advantage.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors">
                {advantage.title}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {advantage.description}
              </p>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${advantage.color} text-white`}>
                {advantage.stats}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 lg:p-12 text-white"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Proven Track Record
            </h3>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto">
              Numbers that speak louder than words. Our results-driven approach 
              has helped hundreds of companies achieve their digital transformation goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2">{achievement.number}</div>
                <div className="text-xl font-semibold mb-2">{achievement.label}</div>
                <div className="text-primary-100 text-sm">{achievement.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20"
        >
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Zoptal vs Traditional Development
              </h3>
              <p className="text-gray-600 text-lg">
                See how our AI-accelerated approach compares to traditional development methods
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Traditional Development */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-gray-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Traditional</h4>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• 3-6 months development</li>
                  <li>• High costs & overhead</li>
                  <li>• Limited scalability</li>
                  <li>• Manual testing</li>
                  <li>• Delayed feedback</li>
                </ul>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="text-4xl text-primary-600">→</div>
              </div>

              {/* Zoptal Approach */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BoltIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-primary-700 mb-2">Zoptal AI</h4>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• 3-7 days delivery</li>
                  <li>• Cost-effective solutions</li>
                  <li>• Infinite scalability</li>
                  <li>• Automated testing</li>
                  <li>• Real-time iteration</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Experience the Difference?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies that have already transformed their development process 
            with our AI-accelerated platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <span>Start Your Project</span>
              <BoltIcon className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="/pricing"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all font-semibold"
            >
              <span>View Pricing</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}