"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

export function DashboardHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {segments.map((segment, index) => (
            <React.Fragment key={`${segment}-${index}`}>
              <BreadcrumbItem>
                {index < segments.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={`/${segments.slice(0, index + 1).join('/')}`}>{toTitleCase(segment)}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{toTitleCase(segment)}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < segments.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
