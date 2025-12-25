import mongoose from 'mongoose';
import { POST_STATUS } from '../utils/constants.js';

// A simple slugify function
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};


const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Tiêu đề bài viết là bắt buộc'],
            trim: true,
            maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
        },
        content: {
            type: String,
            required: [true, 'Nội dung bài viết là bắt buộc'],
        },
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'Admin',
            required: [true, 'Tác giả là bắt buộc'],
        },
        status: {
            type: Number,
            enum: Object.values(POST_STATUS),
            default: POST_STATUS.DRAFT,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        tags: [String],
        cover_image_url: {
            type: String,
            default: 'https://via.placeholder.com/1200x600.png?text=Gym+Article'
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        collection: 'Posts' // Explicitly set the collection name
    }
);

// Pre-save hook to generate a unique slug from the title
PostSchema.pre('save', async function () {
    // Only generate a new slug if the title is modified or it's a new document
    if (this.isModified('title') || this.isNew) {
        try {
            let baseSlug = slugify(this.title);
            let slug = baseSlug;
            let counter = 1;

            // Asynchronously check if the slug already exists and append a counter if it does
            while (await this.constructor.findOne({ slug })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            this.slug = slug;
        } catch (error) {
            // If an error occurs during slug generation, prevent the document from saving.
            // Mongoose will catch this thrown error.
            throw new Error('Lỗi khi tạo slug cho bài viết: ' + error.message);
        }
    }
});

const Post = mongoose.model('Post', PostSchema);
export default Post;
