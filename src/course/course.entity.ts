import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
    id: number;

      @Column()
        category: string;

          @Column()
            title: string;

              @Column()
                description: string;

                  @Column('text')
                    content: string;
                    }
                    