import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CategoryBar from '../components/CategoryBar'
import DressCard from '../components/DressCard'
import DressModal from '../components/DressModal'
import api from '../api/axios'

const Home = () => {
    const navigate = useNavigate()
    const [dresses, setDresses] = useState([])
    const [filtered, setFiltered] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDress, setSelectedDress] = useState(null)
    const [loading, setLoading] = useState(true)
 
    useEffect(() => {
    const fetchDresses = async () => {
        try {
            const res = await api.get('/dresses', {
                params: {
                    category: selectedCategory,
                    search: searchQuery
                }
            })
            setDresses(res.data.data)
            setFiltered(res.data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    fetchDresses()
}, [selectedCategory, searchQuery]) 

    const handleDressClick = (dress) => {
        const isMobile = window.innerWidth < 768
        if (isMobile) {
            navigate(`/dress/${dress._id}`)
        } else {
            setSelectedDress(dress)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar onSearch={(q) => setSearchQuery(q)} />
            <CategoryBar
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-gray-100 rounded-xl mb-3" />
                                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <p className="text-lg font-medium">No dresses found</p>
                        <p className="text-sm mt-1">Try a different category or search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {dresses.map((dress) => (
                            <DressCard
                                key={dress._id}
                                dress={dress}
                                onClick={handleDressClick}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Desktop Modal */}
            {selectedDress && (
                <DressModal
                    dress={selectedDress}
                    onClose={() => setSelectedDress(null)}
                />
            )}
        </div>
    )
}

export default Home