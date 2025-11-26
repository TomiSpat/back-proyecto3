import { RoleEntity } from 'src/auth/role/entities/role.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PermissionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;

  @ManyToMany(
    () => RoleEntity,
    (permissionEntity) => permissionEntity.permissionCodes,
  )
  role: RoleEntity[];
}
