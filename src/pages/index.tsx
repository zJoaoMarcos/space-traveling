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
import { Header } from '../components/Header';

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

  function formatDate(date: string) {
    const newDate = new Date(date);
    const formattedDate = format(newDate, 'dd MMM y', {
      locale: ptBR,
    });

    return formattedDate;
  }

  async function fetchMoreArticles(url: string) {
    const response = await fetch(url);
    const data = await response.json();

    const { results, next_page } = data;

    setNextArticles(next_page);

    results?.forEach(post => {
      const nextPost = {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
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
        <title>Home | Space Traveling</title>
      </Head>

      <Header />
      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link
              key={post.uid}
              href={{ pathname: `/post/${post.uid}` }}
              passHref
            >
              <a>
                <strong>{post?.data?.title}</strong>
                <p>{post?.data?.subtitle}</p>

                <div className={commonStyles?.postInfo}>
                  <span>
                    <FiCalendar /> {formatDate(post?.first_publication_date)}
                  </span>
                  <span>
                    <FiUser /> {post?.data.author}
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

  const { results, next_page } = postsResponse;

  const posts: Post[] = results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: { postsPagination: { results: posts, next_page } },
  };
};
