'use client';

export default function SkillsComponent() {
  const cards = [
    {
      id: 1,
      title: "Online Church",
      submodules: ["Sunday Livestream", "Past Messages", "Prayer Rooms"]
    },
    {
      id: 2,
      title: "Bible Learning & Discipleship",
      submodules: ["Foundations", "Deep-Dive Bible Studies", "Devotionals", "Study Plans"]
    },
    {
      id: 3,
      title: "Personal Growth",
      submodules: ["Purpose Discovery", "Confidence Building", "Communication Skills", "Life Skills"]
    },
    {
      id: 4,
      title: "Leadership Development",
      submodules: ["Leadership Programs", "Masterclasses", "Certificates", "Workshops"]
    },
    {
      id: 5,
      title: "Mentorship & Coaching",
      submodules: ["Youth Mentorship", "Adult Mentorship", "Leadership Coaching", "Pastoral Executive Coaching"]
    },
    {
      id: 6,
      title: "Community Engagement",
      submodules: ["Global Groups", "Forums", "Meetups", "Topic Discussions"]
    },
    {
      id: 7,
      title: "Media & Content Hub",
      submodules: ["Sermon Clips", "Podcasts", "Inspirational Content", "Testimonies"]
    },
    {
      id: 8,
      title: "Events & Programs",
      submodules: ["Workshops", "Faith-Based Events", "Guest Speaker Sessions", "Online Programs"]
    }
  ];

  return (
    <div className="relative w-full bg-[#2a2a2a] py-20 overflow-hidden">
      {/* 3D Cube Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-12 gap-0">
          {[...Array(144)].map((_, i) => (
            <div
              key={i}
              className="aspect-square border border-[#1a1a1a]"
              style={{
                background: `linear-gradient(135deg, 
                  ${i % 3 === 0 ? '#3a3a3a' : '#2a2a2a'} 0%, 
                  ${i % 2 === 0 ? '#252525' : '#2a2a2a'} 100%)`,
                transform: `perspective(1000px) rotateX(${i % 5 * 2}deg) rotateY(${i % 7 * 2}deg)`
              }}
            />
          ))}
        </div>
      </div>

      {/* Cards Stack */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 flex items-center justify-center mb-30">
        <div className="relative w-full max-w-md">
          <h1 className="text-4xl font-light text-white text-center mb-8 tracking-widest">
            SERVICES
          </h1>
          
          {/* Stacked Cards */}
          <div className="relative">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="absolute top-0 left-0 w-full border-2 border-white bg-[#3a3a3a]/80 backdrop-blur-sm p-12"
                style={{
                  transform: `translateY(${index * 8}px) translateX(${index * 4}px)`,
                  zIndex: cards.length - index,
                  opacity: index === 0 ? 1 : 0.6
                }}
              >
                <h2 className="text-2xl font-light text-white mb-6">
                  {card.title}
                </h2>
                
                <ul className="space-y-3 text-white">
                  {card.submodules.map((submodule, subIndex) => (
                    <li key={subIndex} className="flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-4"></span>
                      <span className="text-lg">{submodule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            {/* Spacer to maintain height */}
            <div className="invisible border-2 border-white bg-[#3a3a3a]/80 backdrop-blur-sm p-12">
              <h2 className="text-2xl font-light text-white mb-6">
                {cards[0].title}
              </h2>
              <ul className="space-y-3 text-white">
                {cards[0].submodules.map((submodule, subIndex) => (
                  <li key={subIndex} className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-4"></span>
                    <span className="text-lg">{submodule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}