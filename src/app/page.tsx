"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InteractiveQuiz from "@/components/InteractiveQuiz";

const sampleQuizQuestions = [
  {
    id: "1",
    question: "What is the primary advantage of low-bandwidth optimization in rural education?",
    options: [
      "Better video quality",
      "Reduced data consumption",
      "Faster internet speeds",
      "More storage space"
    ],
    correctAnswer: 1,
    explanation: "Low-bandwidth optimization reduces data consumption, making education accessible even with poor internet connectivity."
  },
  {
    id: "2",
    question: "Which technology is most suitable for real-time communication in low-bandwidth environments?",
    options: [
      "4K Video streaming",
      "Audio-first communication",
      "High-resolution images",
      "Large file transfers"
    ],
    correctAnswer: 1,
    explanation: "Audio-first communication requires significantly less bandwidth while maintaining effective real-time interaction."
  }
];

export default function HomePage() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null);

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore({ score, total });
  };

  const features = [
    {
      title: "Low-Bandwidth Optimized",
      description: "Designed to work efficiently even with poor internet connectivity",
      icon: "📡"
    },
    {
      title: "Audio-First Learning",
      description: "Prioritizes clear audio communication over bandwidth-heavy video",
      icon: "🎧"
    },
    {
      title: "Mobile Friendly",
      description: "Works seamlessly on entry-level smartphones",
      icon: "📱"
    },
    {
      title: "Offline Access",
      description: "Download lectures for offline study when connectivity is poor",
      icon: "📥"
    },
    {
      title: "Interactive Features",
      description: "Real-time polls, quizzes, and discussion boards",
      icon: "🎯"
    },
    {
      title: "Simple Interface",
      description: "Easy to use for both teachers and students",
      icon: "✨"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Remote Classroom</h1>
              <p className="text-sm text-gray-600">Bridging the Rural Education Gap</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Low-Bandwidth Optimized
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Quality Education for
              <span className="text-blue-600"> Rural Students</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A revolutionary remote learning platform designed specifically for rural diploma colleges 
              with limited internet connectivity. Bringing expert instruction to every campus.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/classroom">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Start Teaching
              </Button>
            </Link>
            <Link href="/student">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Join as Student
              </Button>
            </Link>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="bg-red-50 rounded-xl p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-red-800">The Challenge</h3>
            <p className="text-red-700 max-w-4xl mx-auto">
              Rural diploma colleges often lack subject lecturers in specialized fields like AI, VLSI, 
              or renewable energy. Students must rely on self-study or travel to cities for coaching, 
              deepening the urban-rural learning divide. Traditional video-conferencing fails due to 
              low and unstable internet speeds.
            </p>
          </div>
        </section>

        {/* Solution */}
        <section className="bg-green-50 rounded-xl p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-green-800">Our Solution</h3>
            <p className="text-green-700 max-w-4xl mx-auto">
              A platform that embraces low-bandwidth realities, prioritizes audio quality, compresses 
              visual content, and ensures learning continues even during connectivity lapses. Features 
              both live engagement and asynchronous access for maximum flexibility.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">Key Features</h3>
            <p className="text-gray-600 mt-2">Built for rural education challenges</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">Try Interactive Learning</h3>
            <p className="text-gray-600 mt-2">Experience our quiz feature designed for low-bandwidth environments</p>
          </div>

          {!showQuiz ? (
            <div className="text-center">
              <Button 
                onClick={() => setShowQuiz(true)}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Start Sample Quiz
              </Button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <InteractiveQuiz 
                questions={sampleQuizQuestions}
                title="Remote Learning Basics"
                onComplete={handleQuizComplete}
              />
              {quizScore && (
                <div className="mt-4 text-center">
                  <Button 
                    onClick={() => {
                      setShowQuiz(false);
                      setQuizScore(null);
                    }}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Statistics */}
        <section className="bg-blue-50 rounded-xl p-8">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-blue-800">Impact Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">85%</div>
                <p className="text-blue-700">Bandwidth Reduction</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">90%</div>
                <p className="text-blue-700">Mobile Compatibility</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <p className="text-blue-700">Offline Access</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 bg-gray-900 text-white rounded-xl p-12">
          <h3 className="text-3xl font-bold">Ready to Transform Rural Education?</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join thousands of educators and students already using our platform to bridge 
            the urban-rural learning divide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/classroom">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3">
                Get Started as Teacher
              </Button>
            </Link>
            <Link href="/student">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3">
                Join as Student
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Remote Classroom. Empowering rural education through technology.
          </p>
        </div>
      </footer>
    </div>
  );
}
