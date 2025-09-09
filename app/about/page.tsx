"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Users,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description:
        "We approach every family's story with empathy, understanding, and genuine care during their most difficult moments.",
    },
    {
      icon: Shield,
      title: "Dignity",
      description:
        "Every memorial deserves respect. We ensure that all tributes are handled with the utmost dignity and cultural sensitivity.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "We believe in the power of community support. Our platform connects families with their extended networks during times of need.",
    },
    {
      icon: Star,
      title: "Excellence",
      description:
        "We strive for excellence in every aspect of our service, from user experience to customer support.",
    },
  ];

  const team = [
    {
      name: "Kwame Asante",
      role: "Founder & CEO",
      image: "/funeral1.jpg",
      bio: "Former tech executive with a passion for using technology to serve Ghanaian communities.",
    },
    {
      name: "Akosua Mensah",
      role: "Head of Operations",
      image: "/funeral3.jpg",
      bio: "Community leader with 15+ years experience in funeral services and cultural preservation.",
    },
    {
      name: "Kofi Boateng",
      role: "Lead Developer",
      image: "/funeral5.jpg",
      bio: "Full-stack developer dedicated to creating accessible, user-friendly digital experiences.",
    },
  ];

  const milestones = [
    {
      year: "2023",
      event: "damarifadue founded with a vision to digitize funeral services",
    },
    { year: "2023", event: "First 100 families joined our platform" },
    { year: "2024", event: "Expanded to all 16 regions of Ghana" },
    {
      year: "2024",
      event: "Reached 500+ families served and ₵50K+ in community support",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-600/20"></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center text-white"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                About{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  damarifadue
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-8">
                We're on a mission to honor lives, preserve memories, and
                strengthen communities across Ghana through dignified digital
                funeral services.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl px-8 py-4 text-lg font-semibold"
                >
                  <Link href="/contact">Get in Touch</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 rounded-2xl px-8 py-4 text-lg font-semibold bg-transparent"
                >
                  <Link href="/funerals">View Funerals</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid lg:grid-cols-2 gap-16 items-center"
              >
                <div>
                  <h2 className="text-4xl font-bold text-slate-800 mb-6">
                    Our Mission
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    In Ghanaian culture, funerals are not just
                    ceremonies—they're celebrations of life, community
                    gatherings, and sacred traditions that bring families
                    together. We recognized that in our digital age, these
                    important moments needed a platform that honors tradition
                    while embracing modern convenience.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    damarifadue was born from the understanding that every
                    life deserves to be celebrated with dignity, and every
                    family deserves support during their time of grief. We're
                    here to bridge distances, preserve memories, and ensure that
                    no one grieves alone.
                  </p>
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-slate-700 font-medium">
                      Culturally sensitive and respectful
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-slate-700 font-medium">
                      Accessible to all Ghanaian communities
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-slate-700 font-medium">
                      Secure and private by design
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-amber-100 to-orange-200 rounded-3xl p-8">
                    <Image
                      src="/funeral2.jpg"
                      alt="Ghanaian funeral ceremony"
                      width={500}
                      height={400}
                      className="rounded-2xl shadow-lg"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
                    <div className="flex items-center space-x-3 mb-3">
                      <Heart className="w-6 h-6 text-red-500" />
                      <span className="font-semibold text-slate-800">
                        500+ Families Served
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Trusted by families across all 16 regions of Ghana
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-br from-slate-100 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                These principles guide everything we do and shape how we serve
                Ghanaian families
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <value.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-4">
                        {value.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Passionate individuals dedicated to serving Ghanaian families
                with technology and compassion
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-amber-600 font-semibold mb-3">
                        {member.role}
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {member.bio}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                From a simple idea to serving hundreds of families across Ghana
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-8"
                  >
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {milestone.year}
                      </span>
                    </div>
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <p className="text-lg text-slate-200">
                        {milestone.event}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-12 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Honor Your Loved One?
                </h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Join hundreds of families who have chosen our platform to
                  create meaningful, dignified tributes that celebrate lives and
                  bring communities together.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-amber-600 hover:bg-slate-50 rounded-2xl px-8 py-4 text-lg font-semibold"
                  >
                    <Link href="/signup">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white/10 rounded-2xl px-8 py-4 text-lg font-semibold bg-transparent"
                  >
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
