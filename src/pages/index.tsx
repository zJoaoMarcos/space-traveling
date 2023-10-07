import Head from 'next/head';
import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { next_page, results } = postsPagination;

  const [posts, setPosts] = React.useState<Post[] | null>(results);
  const [nextArticles, setNextArticles] = React.useState<string | null>(
    next_page
  );

  async function fetchMoreArticles(url: string) {
    const response = await fetch(url);
    const data = await response.json();

    const { results, next_page } = data;

    setNextArticles(next_page);

    results?.forEach(post => {
      const nextPost = {
        uuid: post.id,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM y',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };

      setPosts([...posts, nextPost]);
    });
  }

  return (
    <>
      <Head>
        <title>space traveling</title>
      </Head>

      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href="">
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>

                <div>
                  <span>
                    <FiCalendar /> {post.first_publication_date}
                  </span>
                  <span>
                    <FiUser /> {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextArticles && (
          <button onClick={() => fetchMoreArticles(nextArticles)}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ctx => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const results = postsResponse.results.map(post => {
    return {
      uuid: post.id,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM y',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const next_page = postsResponse.next_page;

  return {
    props: { postsPagination: { results, next_page } },
  };
};
