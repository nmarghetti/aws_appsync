import gql from 'graphql-tag';

export const listData = gql`
  query listData {
    listData {
      items {
        id
        content
      }
    }
  }
`;

export const addData = gql`
  mutation addData($content: String!) {
    addData(content: $content) {
      id
      content
    }
  }
`;
export const delData = gql`
  mutation delData($content: String!) {
    delData(content: $content)
  }
`;
