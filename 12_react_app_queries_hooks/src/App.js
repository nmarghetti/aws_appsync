import React, { useState } from 'react';
import { ApolloProvider, useQuery, useMutation } from '@apollo/client';
import { getClientLocal } from './AppClient';
import { listData, addData, delData } from './queries';
import './App.css';

const ListElt = (props) => {
  const { loading, error, data, network } = useQuery(listData);
  console.log({ loading, error, data, network });
  if (loading) return <div>loading</div>;
  if (network) return <div>{`network: ${network}`}</div>;
  if (error) return <div>{`${error}`}</div>;
  return (
    <div>
      List of element:
      <br />
      <select {...props.selected} style={{ minWidth: '100px' }} size={10}>
        {data.listData.items.map((elt, index) => (
          <option key={elt.id}>{elt.content}</option>
        ))}
      </select>
    </div>
  );
};

function useInput(initValue = undefined) {
  const [value, setValue] = useState(initValue);
  function onChange(e) {
    setValue(e.target.value);
  }
  return { value, onChange };
}

const App = () => {
  const [elt, setElt] = useState();
  const [mutate] = useMutation(addData);
  const [del] = useMutation(delData);
  const selected = useInput();

  const onAddElement = (e) => {
    mutate({ variables: { content: elt.value }, refetchQueries: [{ query: listData }] });
    return e.preventDefault();
  };

  const onDeleteTruc = (e) => {
    if (selected.value === undefined) return;
    del({ variables: { content: selected.value }, refetchQueries: [{ query: listData }] });
    return e.preventDefault();
  };

  // There is no need to use the input ref here, only some value could be used, but just showing it is possible like that though
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <ListElt selected={selected} />
        <button onClick={onDeleteTruc}>Remove truc</button>
        <form>
          <input
            defaultValue="some elt"
            ref={(ref) => {
              setElt(ref);
            }}
            type="text"
          />
          <button onClick={onAddElement}>Add element</button>
        </form>
      </header>
    </div>
  );
};

const AppProvider = () => {
  return (
    <ApolloProvider client={getClientLocal()}>
      <App />
    </ApolloProvider>
  );
};

export default AppProvider;
