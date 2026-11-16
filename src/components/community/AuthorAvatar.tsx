import { authorAvatarUrl } from "../../utils/authorAvatar.ts";

type AuthorAvatarProps = {
  author: string;
  className?: string;
};

export default function AuthorAvatar({ author, className = "h-10 w-10" }: AuthorAvatarProps) {
  return (
    <img
      src={authorAvatarUrl(author)}
      alt=""
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
