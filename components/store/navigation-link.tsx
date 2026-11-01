import type {AnchorHTMLAttributes} from 'react';

type NavigationLinkProps=AnchorHTMLAttributes<HTMLAnchorElement>&{
  href:string;
  /** Accepted for existing callers; document navigation does not prefetch. */
  prefetch?:boolean;
};

/**
 * Use the browser's navigation for store pages. The production Vinext Link
 * transition can throw before updating the URL, leaving Login inaccessible
 * from its button even though the server route is healthy.
 */
export default function NavigationLink({prefetch,...props}:NavigationLinkProps){
  void prefetch;
  return <a {...props}/>;
}
