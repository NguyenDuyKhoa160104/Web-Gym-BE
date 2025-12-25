import PackageCategory from '../models/PackageCategory.js';

export const getAllPackageCategories = async (req, res) => {
    try {
        const packageCategories = await PackageCategory.find();
        res.status(200).json(packageCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
