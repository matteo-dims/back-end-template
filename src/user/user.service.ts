import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDTO } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
    private readonly stripeService: StripeService,
  ) {}

  async addUser(createUserDTO: CreateUserDTO): Promise<User> {
    const stripeCustomer = await this.stripeService.createCustomer(createUserDTO.username, createUserDTO.email);
    createUserDTO.stripeCustomerId = stripeCustomer.id;
    const newUser: any = await this.userModel.create(createUserDTO);
    newUser.password = await bcrypt.hash(newUser.password, 10);
    return newUser.save();
  }

  async findUser(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username: username });
    return user;
  }

  async findUserById(id: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ _id: id });
    return user;
  }
}
