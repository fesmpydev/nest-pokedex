import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Seed } from './interfaces/seed.interface';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const { results } = await this.http.get<Seed>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    const pokemonList = results.map(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];

      return { name, no };
    });

    try {
      await this.pokemonModel.insertMany(pokemonList);
      return pokemonList;
    } catch (error) {
      console.log(error);
    }
  }
}
