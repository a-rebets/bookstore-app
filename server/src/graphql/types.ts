import { fileLoader, mergeTypes } from 'merge-graphql-schemas';
import * as path from 'path';

const typesArray = fileLoader(path.join(__dirname, './typedefs'));

export const types = mergeTypes(typesArray, { all: true });
