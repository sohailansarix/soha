-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "readingTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogBookmark" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostProduct" (
    "postId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "BlogPostProduct_pkey" PRIMARY KEY ("postId","productId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");

-- CreateIndex
CREATE INDEX "BlogComment_postId_idx" ON "BlogComment"("postId");

-- CreateIndex
CREATE INDEX "BlogComment_isApproved_idx" ON "BlogComment"("isApproved");

-- CreateIndex
CREATE INDEX "BlogLike_postId_idx" ON "BlogLike"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogLike_postId_userId_key" ON "BlogLike"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogLike_postId_token_key" ON "BlogLike"("postId", "token");

-- CreateIndex
CREATE INDEX "BlogBookmark_userId_idx" ON "BlogBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogBookmark_postId_userId_key" ON "BlogBookmark"("postId", "userId");

-- CreateIndex
CREATE INDEX "BlogView_postId_idx" ON "BlogView"("postId");

-- CreateIndex
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");

-- CreateIndex
CREATE INDEX "BlogPost_isFeatured_idx" ON "BlogPost"("isFeatured");

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogLike" ADD CONSTRAINT "BlogLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogBookmark" ADD CONSTRAINT "BlogBookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogView" ADD CONSTRAINT "BlogView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostProduct" ADD CONSTRAINT "BlogPostProduct_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostProduct" ADD CONSTRAINT "BlogPostProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
