const DressCard = ({ dress, onClick }) => {
    return (
        <div
            onClick={() => onClick(dress)}
            className="group cursor-pointer"
        >
            {/* Image */}
            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 mb-3">
                <img
                    src={dress.image?.url}
                    alt={dress.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Info */}
            <div className="px-1">
                <p className="text-sm font-medium text-gray-900 truncate">{dress.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{dress.category}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">₹{dress.price}</p>
            </div>
        </div>
    )
}

export default DressCard