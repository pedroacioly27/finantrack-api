import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthRequest } from 'src/types/auth-request.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const emailExist = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (emailExist) {
      throw new ConflictException('Email already in use');
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashPassword,
    });
    await this.userRepository.save(user);

    const { password: _, ...newUser } = user;

    return newUser;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password: _, ...userLogged } = user;

    return userLogged;
  }
}
