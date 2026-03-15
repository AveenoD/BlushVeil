import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Package, LayoutDashboard, ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const CATEGORIES = ['Casual', 'Formal', 'Party', 'Nighty', 'Undergarment']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const emptyForm = { name: '', description: '', price: '', category: 'Casual', stock: '', colors: '' }

const AdminPanel = () => {
    const navigate = useNavigate()
    const [dresses, setDresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingDress, setEditingDress] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [selectedSizes, setSelectedSizes] = useState([])
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchDresses = async () => {
            try {
                const res = await api.get('/dresses')
                setDresses(res.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchDresses()
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const toggleSize = (size) => {
        setSelectedSizes(prev =>
            prev.includes(size)
                ? prev.filter(s => s !== size)
                : [...prev, size]
        )
    }

    const openAdd = () => {
        setEditingDress(null)
        setForm(emptyForm)
        setSelectedSizes(['S', 'M', 'L', 'XL'])
        setImageFile(null)
        setImagePreview('')
        setError('')
        setShowForm(true)
    }

    const openEdit = (dress) => {
        setEditingDress(dress)
        setForm({
            name: dress.name,
            description: dress.description,
            price: dress.price,
            category: dress.category,
            stock: dress.stock,
            colors: dress.colors?.join(', ') || ''
        })
        setSelectedSizes(dress.sizes || [])
        setImagePreview(dress.image?.url || '')
        setImageFile(null)
        setError('')
        setShowForm(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            const formData = new FormData()
            formData.append('name', form.name)
            formData.append('description', form.description)
            formData.append('price', form.price)
            formData.append('category', form.category)
            formData.append('stock', form.stock)
            formData.append('sizes', JSON.stringify(selectedSizes))

            // Colors — comma separated string to array
            const colorsArray = form.colors
                .split(',')
                .map(c => c.trim())
                .filter(c => c !== '')
            formData.append('colors', JSON.stringify(colorsArray))

            if (imageFile) formData.append('dressImage', imageFile)

            if (editingDress) {
                const res = await api.patch(`/dresses/update/${editingDress._id}`, formData)
                setDresses(prev => prev.map(d => d._id === editingDress._id ? res.data.data : d))
            } else {
                const res = await api.post('/dresses/add', formData)
                setDresses(prev => [...prev, res.data.data])
            }
            setShowForm(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (dressId) => {
        if (!window.confirm('Delete this dress?')) return
        try {
            await api.delete(`/dresses/delete/${dressId}`)
            setDresses(prev => prev.filter(d => d._id !== dressId))
        } catch (err) {
            console.error(err)
        }
    }

    const totalStock = dresses.reduce((sum, d) => sum + d.stock, 0)

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LayoutDashboard size={20} />
                    <span className="font-semibold text-gray-900">Admin Panel</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <ClipboardList size={15} />
                        Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        ← Back to Store
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">Total Products</p>
                        <p className="text-2xl font-semibold text-gray-900">{dresses.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">Total Stock</p>
                        <p className="text-2xl font-semibold text-gray-900">{totalStock}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">Out of Stock</p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {dresses.filter(d => d.stock === 0).length}
                        </p>
                    </div>
                </div>

                {/* Table Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">All Dresses</h2>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-1.5 bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={15} />
                        Add Dress
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                    ) : dresses.length === 0 ? (
                        <div className="p-12 flex flex-col items-center text-gray-400">
                            <Package size={32} className="mb-3 opacity-40" />
                            <p className="text-sm">No dresses yet. Add your first one!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left">
                                        <th className="px-4 py-3 text-xs font-medium text-gray-400">Image</th>
                                        <th className="px-4 py-3 text-xs font-medium text-gray-400">Name</th>
                                        <th className="px-4 py-3 text-xs font-medium text-gray-400">Category</th>
                                        <th className="px-4 py-3 text-xs font-medium text-gray-400">Price</th>
                                        <th className="px-4 py-3 text-xs font-medium text-gray-400">Sizes</th>
                                        <th className="px-4 py-3 text-xs font-medium text-gray-400">Stock</th>
                                        <th className="px-4 py-3 text-xs font-medium text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dresses.map((dress) => (
                                        <tr key={dress._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <img src={dress.image?.url} alt={dress.name}
                                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{dress.name}</td>
                                            <td className="px-4 py-3 text-gray-500">{dress.category}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">₹{dress.price}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {dress.sizes?.join(', ') || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${dress.stock === 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                                    {dress.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEdit(dress)}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(dress._id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">
                                {editingDress ? 'Edit Dress' : 'Add New Dress'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                            {error && (
                                <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl">{error}</div>
                            )}

                            {/* Image Upload */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Dress Image</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                                    ) : (
                                        <p className="text-sm text-gray-400">Click to upload image</p>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange}
                                        className="mt-2 text-xs text-gray-500 w-full" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
                                <input name="name" value={form.name} onChange={handleChange} required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                    placeholder="Floral Kurti" />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
                                    placeholder="Describe the dress..." />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Price (₹)</label>
                                    <input name="price" type="number" value={form.price} onChange={handleChange} required min="0"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                        placeholder="799" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Stock</label>
                                    <input name="stock" type="number" value={form.stock} onChange={handleChange} required min="0"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                        placeholder="50" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                                <select name="category" value={form.category} onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 bg-white">
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Sizes */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-2 block">Sizes</label>
                                <div className="flex gap-2 flex-wrap">
                                    {ALL_SIZES.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                                                ${selectedSizes.includes(size)
                                                    ? 'bg-black text-white border-black'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">
                                    Colors <span className="text-gray-400 font-normal">(comma separated)</span>
                                </label>
                                <input name="colors" value={form.colors} onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                    placeholder="Red, Blue, Green, Black" />
                            </div>

                            <button type="submit" disabled={submitting}
                                className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2">
                                {submitting ? 'Saving...' : editingDress ? 'Update Dress' : 'Add Dress'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminPanel