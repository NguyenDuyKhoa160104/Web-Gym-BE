import mongoose from 'mongoose';
import { STUDENT_STATUS } from '../utils/constants.js';

const StudentSchema = new mongoose.Schema(
    {
        coach: {
            type: mongoose.Schema.ObjectId,
            ref: 'Coach',
            required: [true, 'Học viên phải có HLV'],
        },
        client: {
            type: mongoose.Schema.ObjectId,
            ref: 'Client',
            required: [true, 'Học viên phải là một Client'],
        },
        enrollmentDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: Object.values(STUDENT_STATUS),
            default: STUDENT_STATUS.ACTIVE,
        },
        // Potentially add more fields here like program details, progress, etc.
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
        collection: 'Students',
    }
);

// Optional: Add a compound unique index if a client can only be a student of a specific coach once
// StudentSchema.index({ coach: 1, client: 1 }, { unique: true });

const Student = mongoose.model('Student', StudentSchema);

export default Student;
