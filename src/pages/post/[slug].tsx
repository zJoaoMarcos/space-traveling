import { GetStaticPaths, GetStaticProps, GetStaticPropsResult } from 'next';

import { getPrismicClient } from '../../services/prismic';
import PrismicDOM from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Header } from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  function formatDate(date: string) {
    const newDate = new Date(date);
    const formattedDate = format(newDate, 'dd MMM y', {
      locale: ptBR,
    });

    return formattedDate;
  }

  function getPostReadingTime(content: Array<{ body: { text: string }[] }>) {
    const humanReadingTime = 200;

    const allBodyWords = content.reduce((totalWords, content) => {
      const bodyWords = PrismicDOM.RichText.asText(content.body).split(
        ' '
      ).length;
      return totalWords + bodyWords;
    }, 0);

    const postReadingTime = Math.ceil(allBodyWords / humanReadingTime);

    return `${postReadingTime} min`;
  }

  if (isFallback) {
    return (
      <div className={styles.fallbackContainer}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />
      <main className={commonStyles.mainContainer}>
        <img src={post.data.banner.url} className={styles.bannerPost} />

        <section className={styles.postContainer}>
          <h1>{post.data.title}</h1>

          <div className={commonStyles.postInfo}>
            <span>
              <FiCalendar /> {formatDate(post.first_publication_date)}
            </span>
            <span>
              <FiUser /> {post.data.author}
            </span>
            <span>
              <FiClock /> {getPostReadingTime(post.data.content)}
            </span>
          </div>

          {post.data.content.map(content => (
            <div key={content.heading}>
              <h5>{content.heading}</h5>
              <p>{PrismicDOM.RichText.asText(content.body)}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    pageSize: 6,
  });

  const paths = posts.results.map(post => {
    return { params: { slug: post.uid } };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', slug as string);

  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: { url: response.data.banner.url },
      author: response.data.author,
      content: response.data.group?.map(item => {
        return {
          heading: item.heading,
          body: item.body,
        };
      }),
    },
  };

  return {
    props: { post },
  };
};
