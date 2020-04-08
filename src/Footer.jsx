import React from 'react';
import fs from 'fs';
import path from 'path';

import Provider from './Provider';

import { getFullName, docTypeText } from '../utils';

const sprites = fs
  .readdirSync('./images/sprites/')
  .filter((path) => path.endsWith('.png'));
const randomId = Math.floor(Math.random() * (sprites.length - 1));

const pathImage = path.join(
  __dirname,
  '..',
  `images/sprites/${sprites[randomId]}`,
);
const randomSprite = `file://${pathImage}`;

const Footer = ({ provider, doc, type }) => {
  let typeText = docTypeText[type];

  return (
    <div>
      <div className='image'>
        <img src={randomSprite} alt='pokemon' />
      </div>
      <Provider {...provider} type={type} />
      <footer>
        <div>{getFullName(provider)}</div>
        <div>{doc.label}</div>
        <div>{`${typeText} nº ${doc.id}`}</div>
      </footer>
    </div>
  );
};

export default Footer;
