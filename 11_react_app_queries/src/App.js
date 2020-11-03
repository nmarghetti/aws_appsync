import React from 'react';
import { ApolloProvider, withApollo, graphql } from 'react-apollo';
import './App.css';
import { getClientLocal } from './AppClient';
import { listData, addData, delData } from './queries';

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

export function withApolloComponent(
  component,
  query,
  getProps = () => ({}),
  getOptions = () => ({}),
  queryName = 'withApollo',
  skipQuery = false,
) {
  return withApollo(buildQuery(query, getProps, getOptions, queryName, skipQuery)(component));
}

// queryName is anyway 'withApollo' by default
export function buildQuery(
  queryComponent,
  getProps,
  getOptions = () => ({}),
  queryName = 'withApollo',
  skipQuery = false,
  returnDataKey = 'graphqlData',
) {
  return graphql(
    queryComponent,
    {
      options: (props) => ({
        ...{
          context: {
            props,
          },
          fetchPolicy: 'network-only',
        },
        ...getOptions(props),
      }),
      // This option allows to skip to call the query when rendering a component if some conditions are not met.
      skip: skipQuery,
      props: ({ data, ownProps }) => ({ [returnDataKey]: data, ...getProps(data, ownProps) }),
    },
    { name: { queryName } },
  );
}

export function buildMutation(mutationComponent, mutationName, getOptions = () => ({})) {
  return graphql(
    mutationComponent,
    {
      options: (props) => ({
        ...getOptions(props),
      }),
      props: (props) => ({
        [mutationName]: (returnType) =>
          props.mutate({
            variables: returnType,
            awaitRefetchQueries: true,
            optimisticResponse: () => ({
              [mutationName]: {
                ...returnType,
              },
            }),
          }),
      }),
    },
    { name: mutationName },
  );
}

class ListElt extends React.Component {
  render() {
    if (this.props.graphqlData.loading) return <div>loading</div>;
    console.log('graphqldata', this.props.graphqlData);
    if (this.props.graphqlData.error) return <div>{`${this.props.graphqlData.error}`}</div>;
    return (
      <div>
        List of element:
        <br />
        <select {...this.props.selected} style={{ minWidth: '100px' }} size={10}>
          {this.props.graphqlData.listData.items.map((elt, index) => (
            <option key={elt.id}>{elt.content}</option>
          ))}
        </select>
      </div>
    );
  }
}

const ListEltWithData = withApolloComponent(ListElt, listData);

class App extends React.Component {
  constructor() {
    super();
    this.onAddElement = this.onAddElement.bind(this);
    this.onDelElement = this.onDelElement.bind(this);
    this.onEltChange = this.onEltChange.bind(this);
    this.selElt = undefined;
  }

  onEltChange(e) {
    this.selElt = e.target.value;
  }

  onAddElement(e) {
    this.props.addData({ content: this.inputElt.value });
    return e.preventDefault();
  }

  onDelElement(e) {
    console.log(this);
    if (this.selElt === undefined) return;
    this.props.delData({ content: this.selElt });
    return e.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <ListEltWithData
            selected={{ value: this.selElt, onChange: this.onEltChange }}
            ref={(ref) => {
              this.listElt = ref;
            }}
          />
          <button onClick={this.onDelElement}>Remove selected element</button>
          <form>
            <input
              defaultValue="some elt"
              ref={(ref) => {
                this.inputElt = ref;
              }}
              type="text"
            />
            <button onClick={this.onAddElement}>Add element</button>
          </form>
        </header>
      </div>
    );
  }
}

const getMutationOptions = (props) => {
  return {
    refetchQueries: [{ query: listData }],
  };
};

const AppMutate = compose(
  buildMutation(addData, 'addData', getMutationOptions),
  buildMutation(delData, 'delData', getMutationOptions),
)(App);

const AppProvider = () => {
  return (
    <ApolloProvider client={getClientLocal()}>
      <AppMutate />
    </ApolloProvider>
  );
};

export default AppProvider;
