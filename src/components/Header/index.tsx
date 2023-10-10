import Image from 'next/image';
import styles from './header.module.scss';
import Link from 'next/link';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <Link href="/" passHref>
        <a>
          <Image
            alt="logo"
            src="/images/logo.svg"
            width="238px"
            height="25.63px"
          />
        </a>
      </Link>
    </header>
  );
}
