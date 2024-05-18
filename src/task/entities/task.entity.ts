import mongoose, { SchemaOptions, HydratedDocument, Types } from "mongoose";
import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";

const taskSchema: SchemaOptions = {
  autoIndex: true,
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
};

@Schema(taskSchema)
export class Task {
  @Prop({ index: true, type: mongoose.Schema.ObjectId })
  user_id: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  is_completed: boolean;

  @Prop()
  due_date: Date;
}
export const TaskSchema = SchemaFactory.createForClass(Task);

export type TaskDocument = HydratedDocument<Task>;
