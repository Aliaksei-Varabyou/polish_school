import { Component, type ReactNode } from "react";

/** Shows `fallback` when a lazily loaded chunk (trainer app, review, page) fails to load or render. */
export class LoadErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
