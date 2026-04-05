import type { Article } from '@/lib/types';
import { articlesCozinhar } from './cozinhar';
import { articlesDicas } from './dicas';
import { articlesInovacao } from './inovacao';
import { articlesDesign } from './design';
import { articlesCuriosidades } from './curiosidades';

export const articles: Article[] = [
  ...articlesCozinhar,
  ...articlesDicas,
  ...articlesInovacao,
  ...articlesDesign,
  ...articlesCuriosidades,
];
