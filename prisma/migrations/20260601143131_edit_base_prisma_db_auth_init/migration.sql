/*
  Warnings:

  - You are about to drop the `AiModerationLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AiSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentVote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostVote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Space` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpaceInvite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpaceMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpaceRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiSummary" DROP CONSTRAINT "AiSummary_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_postId_fkey";

-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "CommentVote" DROP CONSTRAINT "CommentVote_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentVote" DROP CONSTRAINT "CommentVote_userId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "PostMedia" DROP CONSTRAINT "PostMedia_fileId_fkey";

-- DropForeignKey
ALTER TABLE "PostMedia" DROP CONSTRAINT "PostMedia_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "PostVote" DROP CONSTRAINT "PostVote_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostVote" DROP CONSTRAINT "PostVote_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_postId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_resolvedById_fkey";

-- DropForeignKey
ALTER TABLE "Space" DROP CONSTRAINT "Space_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceInvite" DROP CONSTRAINT "SpaceInvite_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceInvite" DROP CONSTRAINT "SpaceInvite_senderId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceInvite" DROP CONSTRAINT "SpaceInvite_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceMember" DROP CONSTRAINT "SpaceMember_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceMember" DROP CONSTRAINT "SpaceMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceRule" DROP CONSTRAINT "SpaceRule_spaceId_fkey";

-- DropTable
DROP TABLE "AiModerationLog";

-- DropTable
DROP TABLE "AiSummary";

-- DropTable
DROP TABLE "Bookmark";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "CommentVote";

-- DropTable
DROP TABLE "Follow";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "PostMedia";

-- DropTable
DROP TABLE "PostTag";

-- DropTable
DROP TABLE "PostVote";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "Space";

-- DropTable
DROP TABLE "SpaceInvite";

-- DropTable
DROP TABLE "SpaceMember";

-- DropTable
DROP TABLE "SpaceRule";

-- DropTable
DROP TABLE "Tag";

-- DropEnum
DROP TYPE "AccountType";

-- DropEnum
DROP TYPE "CommentStatus";

-- DropEnum
DROP TYPE "InviteStatus";

-- DropEnum
DROP TYPE "MemberRole";

-- DropEnum
DROP TYPE "ModerationResult";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "PostStatus";

-- DropEnum
DROP TYPE "ReportReason";

-- DropEnum
DROP TYPE "ReportStatus";

-- DropEnum
DROP TYPE "SpaceTopic";

-- DropEnum
DROP TYPE "VoteType";
