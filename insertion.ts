import { Course, Level, CourseModel, PrerequisiteModel } from "./Schema/schema";
import { Schema, model, Types } from 'mongoose';
import * as fs from 'fs';
import csv from 'csv-parser';

export const readCSVFile = async <T>(filepath: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        fs.createReadStream(filepath)
            .pipe(csv())
            .on('data', (data: T) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error: Error) => reject(error));
    });
};

export const coursesInsertion = async (data: Course[]): Promise<void> => {
    try {
        await CourseModel.deleteMany();
        await CourseModel.insertMany(data);
        console.log("Courses inserted successfully");
    } catch (error) {
        console.error("Error while inserting courses, ", error);
    }
};

export const prerequisitesInsertion = async (data: any[]): Promise<void> => {
    try {
        await PrerequisiteModel.deleteMany();
        console.log("Prerequisites deleted");

        const courses: Course[] = await CourseModel.find();
        if (courses.length === 0) {
            console.log("No courses found");
            return;
        }

        for (const item of data) {
            if (item.preLevel === 'null' && item.preName === 'null') {
                continue;
            } else {
                const course = await CourseModel.findOne({ level: item.level, name: item.name }, { _id: 1 });
                const prerequisite = await CourseModel.findOne({ level: item.preLevel, name: item.preName }, { _id: 1 });

                if (course && prerequisite) {
                    let existingPrerequisite = await PrerequisiteModel.findOne({ courseId: course._id });

                    if (!existingPrerequisite) {
                        const newPrerequisite = {
                            courseId: course._id,
                            prerequisiteIds: [prerequisite._id],
                        };
                        await PrerequisiteModel.create(newPrerequisite);
                        console.log(`Inserted prerequisite: ${newPrerequisite}`);
                    } else {
                        existingPrerequisite.prerequisiteIds.push(prerequisite._id);
                        await existingPrerequisite.save();
                        console.log(`Updated prerequisite: ${existingPrerequisite}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error inserting prerequisites:", error);
    }
};
