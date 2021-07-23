import React from 'react';

import gql from 'graphql-tag';
import { useQuery, useSubscription } from 'react-apollo-hooks';
import { MutationType } from '../../graphql-types';
import { AuthorsPanel } from './authors-panel';
import { GET_AUTHORS } from './authors-queries';
import { AuthorMutated } from './__generated__/AuthorMutated';

export const AuthorsContainer = () => {
    const { error, data } = useQuery(GET_AUTHORS, { suspend: true });
    if (error) {
        throw error;
    }

    useSubscription(AUTHOR_MUTATED, {
        onSubscriptionData: ({ client, subscriptionData }) => {
            const prevData = client.readQuery({
                query: GET_AUTHORS
            }) as any;

            const authorMutatedWrapper: AuthorMutated = subscriptionData.data;
            const { authorMutated } = authorMutatedWrapper;
            const { mutation, node: subsAuthor } = authorMutated;

            let nextData;
            switch (mutation) {
                case MutationType.CREATED: {
                    if (!findAuthor(prevData.authors, subsAuthor.id)) {
                        nextData = Object.assign({}, prevData, {
                            authors: [...prevData.authors, subsAuthor]
                        });
                    }
                    break;
                }
                case MutationType.UPDATED: {
                    nextData = Object.assign({}, prevData, {
                        authors: prevData.authors.map((author: any) =>
                            author.id === subsAuthor.id ? subsAuthor : author
                        )
                    });
                    break;
                }
                case MutationType.DELETED: {
                    nextData = Object.assign({}, prevData, {
                        authors: prevData.authors.filter(
                            (author: any) => author.id !== subsAuthor.id
                        )
                    });
                    break;
                }
            }

            if (nextData) {
                client.writeQuery({
                    query: GET_AUTHORS,
                    data: nextData
                });
            }
        }
    });

    return <AuthorsPanel data={data} />;
};

function findAuthor(authors: Array<any>, authorId: string) {
    return authors.find(author => author.id === authorId);
}

const AUTHOR_MUTATED = gql`
    subscription AuthorMutated {
        authorMutated {
            mutation
            node {
                __typename
                id
                name
            }
        }
    }
`;
