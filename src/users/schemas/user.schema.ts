import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/roles.enum';

@Schema({
  collection: 'cb_trv_users',
  timestamps: true,
})
export class User extends Document {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  password?: string; // Opcional porque si entra por Google no tendrá password manual

  @Prop()
  googleId?: string; // Para guardar el ID que nos mande Google

  @Prop({
    type: String,
    enum: [Role.TRAVELER, Role.PRO, Role.PLUS, Role.EXCEL],
    default: Role.TRAVELER,
  })
  role: Role;

  @Prop()
  name: string;

  @Prop()
  avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
