import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDTO } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { StripeService } from 'src/stripe/stripe.service';
import { ErrorTemplate } from 'src/utils/error.dto';
import {MailService} from "../mail/mail.service";

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
    private readonly stripeService: StripeService,
    private readonly mailerService: MailService,
  ) {}

  async addUser(createUserDTO: CreateUserDTO): Promise<User> {
    try {
      const user = await this.userModel.findOne({email: createUserDTO.email});
      if (user) {
        throw new ErrorTemplate(400, 'Bad request: User with this email already exist.', 'User');
      }
      const stripeCustomer = await this.stripeService.createCustomer(createUserDTO.username, createUserDTO.email);
      createUserDTO.stripeCustomerId = stripeCustomer.id;
      const newUser: any = await this.userModel.create(createUserDTO);
      newUser.password = await bcrypt.hash(newUser.password, 10);
      if (createUserDTO.roles === null || createUserDTO.roles === undefined) {
        newUser.roles = ['user'];
      }
      await this.mailerService.sendUserConfirmation(createUserDTO.email, createUserDTO.username);
      return newUser.save();
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
      throw new ErrorTemplate(500, error.message || 'Can\'t create a new user.', 'User');
    } 
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
