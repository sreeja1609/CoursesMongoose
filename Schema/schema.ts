import { Schema, model } from 'mongoose';
import { connect } from "../Configuration/config";

type objectId = Schema.Types.ObjectId;

enum Level {
    SSC = 'ssc',
    Diploma = 'diploma',
    Inter = 'inter',
    Degree = 'degree',
    BTech = 'btech',
    Medical = 'medical',
}

const courseNamesByLevel = {
    [Level.SSC]: ['Maths', 'Science', 'English'],
    [Level.Diploma]: ['IT', 'CS', 'ECE', 'EEE'],
    [Level.Inter]: ['MPC', 'BiPC', 'CEC', 'HEC'],
    [Level.Degree]: ['BCom', 'BSc', 'BA'],
    [Level.BTech]: ['CSE', 'ECE', 'EEE', 'Mech'],
    [Level.Medical]: ['MBBS', 'Dental', 'BPharm'],
};

class Course {
    name: string;
    level: Level;

    constructor(name: string, level: Level) {
        if (!courseNamesByLevel[level].includes(name)) {
            throw new Error(`Invalid course name for level ${level}`);
        }
        this.name = name;
        this.level = level;
    }
}

class Prerequisite {
    courseId: objectId;
    prerequisiteIds: objectId[];

    constructor(courseId: objectId, prerequisiteIds: objectId[]) {
        this.courseId = courseId;
        this.prerequisiteIds = prerequisiteIds;
    }
}

// Defining the schema for the Course model
const courseSchema = new Schema<Course>({
    name: {
        type: String,
        required: true,
        validate: {
            validator: function(value: string) {
                const courseLevel = this.level as Level;
                return courseNamesByLevel[courseLevel] ? courseNamesByLevel[courseLevel].includes(value) : false;
            },
            message: 'Invalid course',
        }
    },
    level: {
        type: String,
        required: true,
        enum: Object.values(Level)
    },
});

// Defining the schema for the Prerequisite model
const prerequisiteSchema = new Schema<Prerequisite>({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    prerequisiteIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    }]
});

// Creating and exporting the models
const CourseModel = connect.model<Course>('Course', courseSchema);
console.log("Course Model Created");

const PrerequisiteModel = connect.model<Prerequisite>('Prerequisite', prerequisiteSchema);
console.log("Prerequisite Model Created");

export { Course, Level, Prerequisite, CourseModel, PrerequisiteModel };
