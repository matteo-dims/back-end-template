import {Body, Controller, Get, HttpException, Post, Put, Request, UseGuards,} from '@nestjs/common';
import {CreateUserDTO} from 'src/user/dtos/create-user.dto';
import {UserService} from 'src/user/user.service';
import {AuthService} from './auth.service';
import {LocalAuthGuard} from './guards/local.guard';
import {JwtAuthGuard} from './guards/jwt.guard';
import {Roles} from './decorators/roles.decorator';
import {Role} from './enums/role.enum';
import {RolesGuard} from './guards/roles.guard';
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {UpdateUserDto} from "../user/dtos/update-user.dto";
import {UserMinimalDto} from "../user/dtos/return-user.dto";

@ApiTags('User')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
      private authService: AuthService,
      private userService: UserService,
  ) {
  }

  @Post('/register')
  @ApiOperation({summary: 'Register a new user'})
  @ApiBody({type: CreateUserDTO}) // Define the request body
  @ApiResponse({status: 201, description: 'User registered successfully'})
  async register(@Body() createUserDTO: CreateUserDTO): Promise<UserMinimalDto> {
    try {
        const user = await this.userService.addUser(createUserDTO);
        return {
            username: user.username,
            email: user.email,
        };
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiOperation({summary: 'Login'})
  @ApiResponse({status: 200, description: 'Login successful'})
  async login(@Request() req) {
    try {
        return await this.authService.login(req.user);
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Get('/user')
  @ApiOperation({summary: 'Get user profile'})
  @ApiResponse({status: 200, description: 'Return user profile'})
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('/admin')
  @ApiOperation({summary: 'Get admin dashboard'})
  @ApiResponse({status: 200, description: 'Return admin dashboard data'})
  getDashboard(@Request() req) {
    return req.user;
  }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @Put('/')
    @ApiOperation({summary: 'update a user'})
    @ApiResponse({status: 200, description: 'Return admin dashboard data'})
    async updateUser(@Request() req, @Body() updateUserDTO: UpdateUserDto): Promise<UserMinimalDto> {
        const user = await this.userService.updateUser(req.user.userId, updateUserDTO);
        return {
            username: user.username,
            email: user.email,
        };
    }
}
