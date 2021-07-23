import React from 'react';

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { Provider } from 'mobx-react';
import { HistoryAdapter } from 'mobx-state-router';
import { ApolloProvider } from 'react-apollo-hooks';
import { ErrorBoundary, getTheme } from './components';
import { Shell } from './shell';
import { rootStore } from './stores';
import { history } from './utils/history';

const theme = getTheme();

const historyAdapter = new HistoryAdapter(rootStore.routerStore, history);
historyAdapter.observeRouterStateChanges();

const httpLink = new HttpLink({
    uri: process.env.REACT_APP_HTTP_LINK
});

const wsLink = new WebSocketLink({
    uri: process.env.REACT_APP_WS_LINK!,
    options: {
        reconnect: true
    }
});

interface Definition {
    kind: string;
    operation?: string;
}

const link = split(
    ({ query }) => {
        const { kind, operation }: Definition = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink
);

const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache()
});

export const App = () => {
    return (
        <ErrorBoundary>
            <ApolloProvider client={client}>
                <MuiThemeProvider theme={theme}>
                    <Provider rootStore={rootStore}>
                        <Shell />
                    </Provider>
                </MuiThemeProvider>
            </ApolloProvider>
        </ErrorBoundary>
    );
};
