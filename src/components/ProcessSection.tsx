import React from 'react';

const ProcessSection = () => {
  return (
    <section className="bg-black text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6">
            Our Simple, Smart,
            <br />
            and Scalable Process
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            We design, develop, and implement automation tools that help you work
            smarter, not harder
          </p>
        </div>

        {/* Process Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Step 1 - Smart Analyzing */}
          <div className="border border-gray-800 rounded-2xl p-8 bg-gray-900/20 backdrop-blur-sm">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                Step 1
              </span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Smart Analyzing</h3>
            <p className="text-gray-400 mb-8">
              We assess your needs and identify AI solutions to streamline workflows and improve efficiency.
            </p>
            
            {/* Visual Content */}
            <div className="bg-gray-800/50 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300">Analyzing current workflow...</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System check</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Process check</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Speed check</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Manual work</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Repetitive task</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 - AI Development */}
          <div className="border border-gray-800 rounded-2xl p-8 bg-gray-900/20 backdrop-blur-sm">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                Step 2
              </span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">AI Development</h3>
            <p className="text-gray-400 mb-8">
              Our team builds intelligent automation systems tailored to your business processes.
            </p>
            
            {/* Code Editor Visual */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="font-mono text-sm space-y-2">
                <div className="text-gray-400">
                  <span className="text-blue-400">return</span> <span className="text-green-400">{'Status: {defaultValue}'}</span>
                </div>
                <div className="text-gray-400">
                  <span className="text-purple-400">class</span> <span className="text-yellow-400">AutomationTrigger</span>:
                </div>
                <div className="text-gray-400 ml-4">
                  <span className="text-blue-400">def</span> <span className="text-yellow-400">__init__</span>(<span className="text-orange-400">self, threshold</span>):
                </div>
                <div className="text-gray-400 ml-8">
                  <span className="text-orange-400">self.threshold</span> = threshold
                </div>
                <div className="text-gray-400 ml-8">
                  <span className="text-orange-400">self.status</span> = <span className="text-green-400">&quot;inactive&quot;</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Seamless Integration */}
          <div className="border border-gray-800 rounded-2xl p-8 bg-gray-900/20 backdrop-blur-sm">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                Step 3
              </span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Seamless Integration</h3>
            <p className="text-gray-400 mb-8">
              We smoothly integrate AI solutions into your existing infrastructure with minimal disruption.
            </p>
            
            {/* Integration Visual */}
            <div className="bg-gray-800/50 rounded-xl p-6 flex items-center justify-between">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Our solution</span>
              </div>
              
              <div className="flex-1 mx-6">
                <div className="h-px bg-gradient-to-r from-red-500 to-orange-500"></div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Your stack</span>
              </div>
            </div>
          </div>

          {/* Step 4 - Continuous Optimization */}
          <div className="border border-gray-800 rounded-2xl p-8 bg-gray-900/20 backdrop-blur-sm">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                Step 4
              </span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Continuous Optimization</h3>
            <p className="text-gray-400 mb-8">
              We refine performance, analyze insights, and enhance automation for long-term growth.
            </p>
            
            {/* Metrics Visual */}
            <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Chatbot system</div>
                    <div className="text-xs text-gray-400">Efficiency will increase by 20%</div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Workflow system</div>
                    <div className="text-xs text-gray-400">Update available</div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Sales system</div>
                    <div className="text-xs text-gray-400">Up to date</div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
