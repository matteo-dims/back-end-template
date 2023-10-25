import { UserService } from '../user/user.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ErrorTemplate } from 'src/utils/error.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findUser(username);
    if (!user)
      return null;
    console.log('test ici ça passe zebi')
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (user && isPasswordMatch) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    try {
      const userCheck = await this.userService.findUser(user.username);
      if (!userCheck)
        return {error: 'This user doesn\'t exist.'};
      const payload = {
        username: user.username,
        sub: user._id,
        roles: user.roles,
      };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new ErrorTemplate(500, 'Internal error', 'auth');
    }
  }
}
