import React, { useState } from 'react';
import client from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Package, Droplets, MapPin, Scale } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const CreateBatch = () => {
    const [formData, setFormData] = useState({
        woolType: '',
        weight: '',
        moisture: '',
        source: '',
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 2) {
            alert("You can upload a maximum of 2 images.");
            return;
        }
        setImages([...images, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        images.forEach(image => data.append('images', image));

        try {
            await client.post('/api/batches', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (error) {
            console.error('Error creating batch:', error);
            alert('Failed to create batch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Register New Batch</h1>

                <Card className="hover:shadow-none">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 ml-1 flex items-center gap-2">
                                <Package size={14} className="text-gray-400" /> Wool Type / Breed
                            </label>
                            <select
                                name="woolType"
                                value={formData.woolType}
                                onChange={handleChange}
                                required
                                className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                            >
                                <option value="" disabled>Select wool type...</option>
                                <optgroup label="Ultra-Premium">
                                    <option value="Vicuña">Vicuña — ₹55,000/kg</option>
                                    <option value="Qiviut">Qiviut — ₹35,000/kg</option>
                                </optgroup>
                                <optgroup label="Premium">
                                    <option value="Cashmere">Cashmere — ₹8,000/kg</option>
                                    <option value="Alpaca">Alpaca — ₹3,250/kg</option>
                                    <option value="Angora">Angora — ₹2,750/kg</option>
                                    <option value="Camel">Camel — ₹2,100/kg</option>
                                    <option value="Mohair">Mohair — ₹1,700/kg</option>
                                    <option value="Yak">Yak — ₹1,400/kg</option>
                                </optgroup>
                                <optgroup label="Standard">
                                    <option value="Fine Merino">Fine Merino — ₹1,500/kg</option>
                                    <option value="Merino">Merino — ₹1,000/kg</option>
                                    <option value="Lambswool">Lambswool — ₹1,000/kg</option>
                                    <option value="Shetland">Shetland — ₹650/kg</option>
                                    <option value="Corriedale">Corriedale — ₹600/kg</option>
                                </optgroup>
                                <optgroup label="Economy">
                                    <option value="Crossbred">Crossbred — ₹425/kg</option>
                                    <option value="Lincoln">Lincoln — ₹350/kg</option>
                                    <option value="Coarse Wool">Coarse Wool — ₹275/kg</option>
                                    <option value="Carpet Wool">Carpet Wool — ₹165/kg</option>
                                </optgroup>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Weight (kg)"
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                icon={Scale}
                                required
                            />
                            <Input
                                label="Moisture (%)"
                                type="number"
                                name="moisture"
                                value={formData.moisture}
                                onChange={handleChange}
                                icon={Droplets}
                            />
                        </div>

                        <Input
                            label="Source / Farm Name"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            placeholder="e.g. Highland Farms"
                            icon={MapPin}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Upload Images (Max 2)</label>
                            <div className="grid grid-cols-3 gap-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {previews.length < 2 && (
                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-primary-50 hover:border-primary-400 transition-all group">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-primary-100 group-hover:text-primary-600">
                                            <Upload size={20} className="text-gray-400 group-hover:text-primary-600" />
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">Click to upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/')}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="flex-1"
                            >
                                Create Batch
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CreateBatch;
