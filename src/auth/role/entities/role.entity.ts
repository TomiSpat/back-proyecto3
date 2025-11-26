import { PermissionEntity } from 'src/auth/permission/entities/permission.entity';
import { UserEntity } from 'src/auth/users/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinTable,
} from 'typeorm';

@Entity('role')
export class RoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => PermissionEntity, (roleEntity) => roleEntity.role, {
    eager: true,
  })
  @JoinTable()
  permissionCodes: PermissionEntity[];

  @ManyToMany(() => UserEntity, (user) => user.role)
  user: UserEntity[];
}
