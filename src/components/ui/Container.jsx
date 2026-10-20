import { cx } from '../../lib/cx';

export default function Container({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cx('mx-auto w-full max-w-6xl px-5 sm:px-8', className)} {...props}>
      {children}
    </Tag>
  );
}
