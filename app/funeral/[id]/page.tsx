import { FuneralEventPage } from "@/components/funeral-event-page"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Sample funeral data
const sampleFuneral = {
  id: "1",
  deceased: {
    name: "Kwame Asante",
    photo: "/placeholder.svg?height=300&width=300",
    dob: "1945-03-15",
    dod: "2024-01-10",
    biography:
      "Kwame Asante was a beloved teacher and community leader who dedicated over 40 years of his life to education in Kumasi. Born in a small village in the Ashanti Region, he worked tirelessly to improve educational opportunities for children in rural communities. He was known for his wisdom, kindness, and unwavering commitment to his students and community. Kwame leaves behind a legacy of thousands of students whose lives he touched and a community that will forever remember his contributions. His passion for learning and teaching inspired generations of young minds, and his impact on education in Ghana will be felt for years to come.",
  },
  funeral: {
    date: "2024-01-20",
    time: "09:00",
    venue: "St. Peter's Cathedral",
    region: "Ashanti",
    location: "Kumasi, Ghana",
    coordinates: { lat: 6.6885, lng: -1.6244 },
  },
  family: {
    name: "Asante Family",
    contact: "Contact: +233 24 123 4567",
    details:
      "Survived by his loving wife Mary Asante, 4 children (Akosua, Kwaku, Ama, and Kofi), and 12 grandchildren. The family requests that in lieu of flowers, donations be made to the Kumasi Education Foundation.",
  },
  poster: "/placeholder.svg?height=600&width=400",
  brochure: "/sample-brochure.pdf",
  livestream: "https://youtube.com/watch?v=example",
  isUpcoming: true,
  condolences: [
    {
      id: "1",
      name: "Akosua Mensah",
      message:
        "Mr. Asante was my teacher in primary school. He inspired me to become a teacher myself. His dedication to education and his students was unmatched. Rest in peace, sir.",
      location: "Accra",
      timestamp: "2024-01-12T10:30:00Z",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Kofi Boateng",
      message:
        "A great man who touched many lives. My condolences to the family. Mr. Asante taught my children and they still speak of his kindness.",
      location: "Kumasi",
      timestamp: "2024-01-12T14:15:00Z",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Ama Osei",
      message:
        "Thank you for everything you did for our community. Your legacy will live on through all the lives you touched.",
      location: "Kumasi",
      timestamp: "2024-01-13T09:20:00Z",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ],
  donations: {
    total: 5420,
    currency: "GHS",
    supporters: 23,
    recent: [
      { name: "Anonymous", amount: 200, message: "In memory of a great teacher" },
      { name: "Former Students", amount: 500, message: "Thank you for everything, Mr. Asante" },
      { name: "Kumasi Teachers Union", amount: 1000, message: "Honoring a dedicated educator" },
    ],
  },
}

export default function FuneralPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main className="pt-20">
        <FuneralEventPage funeral={sampleFuneral} />
      </main>
      <Footer />
    </div>
  )
}
