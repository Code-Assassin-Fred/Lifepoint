import React from 'react';

export default function InsideLifepoint() {
  return (
    <section className="w-full bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black text-gray-700 uppercase mb-6 tracking-tight">
            Inside Lifepoint
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto">
            From iconic stage moments to behind-the-scenes breakthroughs—witness the legacy of Lifepoint in motion.
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {/* Row 1 */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/Mandatory4.jpg"
              alt="Lifepoint team moment"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/mike1.jpg"
              alt="Lifepoint leadership"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/Mike2.jpg"
              alt="Lifepoint event"
              className="w-full h-full object-cover object-top"
            />
          </div>
          
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/Mandatory1.jpg"
              alt="Lifepoint gathering"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Row 2 */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/Mandatory2.jpg"
              alt="Lifepoint experience"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/mandatory3.jpg"
              alt="Lifepoint community"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="lg:col-span-2 relative aspect-[8/3] lg:aspect-[2/1] overflow-hidden rounded-lg">
            <img
              src="/Mandatory4.jpg"
              alt="Lifepoint legacy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Founder Section */}
        <div className="mb-8">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
            Founder
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Image with LinkedIn Icon */}
          <div className="relative max-w-md">
            <img
              src="/founder1.jpg"
              alt="Dr. Mike Mutua - Founder"
              className="w-full h-96 object-cover object-top rounded-lg shadow-lg"
            />
            {/* LinkedIn Icon Overlay */}
            <a 
              href="https://www.linkedin.com/in/mikelifepoint" 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-gray-700">
              <span className="text-red-600">"My calling has always been about empowering youth, adults and leaders and transforming lives through biblical truth and practical wisdom. Over the past decade, I've been privileged to build LifePoint Ministry from the ground up, train thousands of leaders, and establish platforms where authentic faith meets real-world leadership. It's not just about preaching but more about equipping people to walk in purpose and lead with excellence."</span>
            </p>
          </div>
        </div>

        {/* About Dr. Mike Section */}
        <div className="mt-16">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Dr. Mike Mutua
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-4 max-w-4xl">
            Passionate Christian Leader, Leadership Coach, mentorship champion, administrator, communicator, and university lecturer with a demonstrated history of achieving results and excellence in delivery and performance.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-4xl">
            Dr. Mutua serves as the Founder and National Bishop of LifePoint Ministry Kenya, Lead Strategist at The Ark Consult, and Principal of Pwani International Christian College. He is skilled in coaching leaders, leading teams, public speaking, leadership team training, church planting, and pastoral counseling.
          </p>
          
          {/* Experience and Education Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Experience */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Experience</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-gray-800">LifePoint Ministry Kenya</h5>
                  <p className="text-gray-600 text-sm">National Bishop & Founder</p>
                  <p className="text-gray-500 text-sm">2014 - Present • 11+ Years</p>
                </div>
                <div>
                  <h5 className="font-bold text-gray-800">Pwani Int'l Christian College</h5>
                  <p className="text-gray-600 text-sm">Principal/President</p>
                  <p className="text-gray-500 text-sm">2017 - Present • 8 Years</p>
                </div>
                <div>
                  <h5 className="font-bold text-gray-800">Leadership Coaching & Consulting</h5>
                  <p className="text-gray-600 text-sm">Lead Strategist</p>
                  <p className="text-gray-500 text-sm">2014 - Present • 11+ Years</p>
                </div>
                <div>
                  <h5 className="font-bold text-gray-800">Crossroads Fellowship - Nyali</h5>
                  <p className="text-gray-600 text-sm">Executive Pastor</p>
                  <p className="text-gray-500 text-sm">2010 - 2014 • 4 Years</p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Education & Credentials</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Doctor of Ministry in Organizational Leadership - Asbury Theological Seminary (USA)</li>
                <li>• Master of Theology in Biblical Interpretation - University of Aberdeen (UK)</li>
                <li>• Master of Arts in Church History - Africa International University (Kenya)</li>
                <li>• Bachelor of Theology - Scott Christian University (Kenya)</li>
                <li>• Ordained and Licensed Minister</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}