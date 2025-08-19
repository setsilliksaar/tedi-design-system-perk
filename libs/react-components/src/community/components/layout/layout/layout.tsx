import { autoUpdate, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';
import cn from 'classnames';
import React from 'react';

import { Section } from '../../../../tedi/components/content/section/section';
import { useElementSize } from '../../../../tedi/helpers/hooks/use-element-size';
import { AccessibilityProvider } from '../../../../tedi/providers/accessibility-provider/accessibility-provider';
import Breadcrumbs, { BreadcrumbsProps } from '../breadcrumbs/breadcrumbs';
import { Footer, FooterProps } from '../footer/footer';
import { Header, HeaderProps } from '../header';
import { LayoutContext } from '../layout-context';
import SideNav, { SideNavProps } from '../sidenav/sidenav';
import { useSidenavRendered } from '../sidenav/utility';
import styles from './layout.module.scss';

export interface ILayoutProps<
  B extends React.ElementType = 'a',
  S extends React.ElementType = 'a',
  H extends React.ElementType = 'a'
> {
  /**
   * Main content of the application
   */
  children: React.ReactElement;
  /**
   * Header props passed to Header component
   */
  header: HeaderProps<H>;
  /**
   * SideNav props passed to SideNav component
   */
  sideNav?: SideNavProps<S>;
  /**
   * Main content id, used to navigate from skip-links
   * @default main-content
   */
  mainContentId?: string;
  /**
   * Main content className
   */
  mainContentClassName?: string;
  /**
   * Footer props passed to Footer component
   */
  footer?: FooterProps;
  /**
   * Remove max-width and padding from main. Allows the content to take all available space.
   */
  growMainContent?: boolean;
  /**
   * Breadcrumbs props passed to Breadcrumbs component
   */
  breadcrumbsProps?: BreadcrumbsProps<B>;
  /**
   * Logo shown on top-right of the main content area
   */
  mainLogo?: {
    src: string;
    alt: string;
    style: React.CSSProperties;
  };
  /**
   * Type of the Header
   * - System header is meant for logged in system
   * - Public is meant for public pages where user is not yet signed in, usually also does not have sidenav on desktop
   * @default 'system'
   */
  headerType?: 'system' | 'public';
  /**
   * Custom toggle function for mobile menu
   * If provided, SidenavToggle will be shown and this function will be called when toggled
   * @param menuOpen - The current state of the menu (true if open, false if closed)
   * @default undefined
   */
  onHeaderSidenavToggle?: (menuOpen: boolean) => void;
}
export const Layout = <
  B extends React.ElementType = 'a',
  S extends React.ElementType = 'a',
  H extends React.ElementType = 'a'
>(
  props: ILayoutProps<B, S, H>
): JSX.Element => {
  const {
    children,
    header,
    sideNav,
    breadcrumbsProps,
    footer,
    mainContentId = 'main-content',
    mainContentClassName,
    mainLogo,
    growMainContent,
    headerType = 'system',
    onHeaderSidenavToggle,
    ...rest
  } = props;

  const headerElement = React.useRef<HTMLElement>(null);
  const headerBottomElement = React.useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { hasSidenav } = useSidenavRendered(headerType, sideNav);

  const floatingDisabled = !!onHeaderSidenavToggle && !sideNav;
  const { y, refs, context } = useFloating({
    placement: 'bottom-start',
    open: menuOpen,
    onOpenChange: floatingDisabled ? undefined : setMenuOpen,
    whileElementsMounted: (...args) => autoUpdate(...args, { ancestorScroll: false }),
  });
  const interactions = useInteractions([useClick(context), useRole(context, { role: 'dialog' }), useDismiss(context)]);
  const getReferenceProps = floatingDisabled ? () => ({}) : interactions.getReferenceProps;
  const getFloatingProps = floatingDisabled ? () => ({}) : interactions.getFloatingProps;
  const headerBottomSize = useElementSize(headerBottomElement);

  const mainBem = cn(styles['main'], {
    [styles['main--with-sidenav']]: hasSidenav,
    [styles['main--grow']]: growMainContent,
  });

  React.useEffect(() => {
    if (document && headerBottomSize) {
      document.documentElement.style.setProperty('--header-bottom-height', `${headerBottomSize?.height ?? 0}px`);
    }

    return () => {
      document.documentElement.style.removeProperty('--header-bottom-height');
    };
  }, [headerBottomSize]);

  const toggleMenu = React.useCallback(() => {
    if (onHeaderSidenavToggle && !sideNav) {
      // Custom toggle mode - only call the custom callback
      setMenuOpen((prev) => {
        const next = !prev;
        setTimeout(() => onHeaderSidenavToggle(next), 0);
        return next;
      });
    } else {
      // Regular sidenav mode - let floating UI handle it
      setMenuOpen((prev) => !prev);
    }
  }, [onHeaderSidenavToggle, sideNav]);

  // Remove the useEffect that was causing infinite loops

  const contextValue = React.useMemo(
    () => ({
      y,
      menuOpen,
      toggleMenu,
      headerType,
      reference: refs.setReference,
      floating: refs.setFloating,
      context,
      getReferenceProps,
      getFloatingProps,
      sideNavProps: sideNav,
      headerElement,
      headerBottomElement,
      headerBottomSize,
      onHeaderSidenavToggle,
    }),
    [
      y,
      menuOpen,
      toggleMenu,
      headerType,
      refs.setReference,
      refs.setFloating,
      context,
      getReferenceProps,
      getFloatingProps,
      sideNav,
      headerElement,
      headerBottomElement,
      headerBottomSize,
      onHeaderSidenavToggle,
    ]
  );

  return (
    <LayoutContext.Provider value={contextValue}>
      <AccessibilityProvider>
        <div data-name="layout" {...rest} className={styles['container-wrapper']}>
          <Header {...header} />
          <div className={cn(styles['container'], { [styles['container--menu-open']]: menuOpen })}>
            {sideNav && <SideNav {...sideNav} />}
            <div className={mainBem}>
              {mainLogo && (
                <img className={styles['main__logos']} src={mainLogo.src} alt={mainLogo.alt} style={mainLogo.style} />
              )}
              <main className={cn(styles['main__content'], mainContentClassName)} id={mainContentId} tabIndex={-1}>
                {breadcrumbsProps && (
                  <Section>
                    <Breadcrumbs className={styles['main__breadcrumbs']} {...breadcrumbsProps} />
                  </Section>
                )}
                {children}
              </main>
            </div>
          </div>
          {footer && <Footer {...footer} />}
        </div>
      </AccessibilityProvider>
    </LayoutContext.Provider>
  );
};

export default Layout;
