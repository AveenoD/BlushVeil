const CATEGORIES = ['All', 'Casual', 'Formal', 'Party', 'Nighty', 'Undergarment']

const CategoryBar = ({ selected, onSelect }) => {
    return (
        <div className="w-full border-b border-gray-100 bg-white sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat)}
                            className={`shrink-0 text-sm px-4 py-1.5 rounded-full font-medium transition-colors
                                ${selected === cat
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CategoryBar