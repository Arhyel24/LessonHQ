import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import { put } from "@vercel/blob";
import { createActivity } from "@/lib/utils/activityHelper";

/**
 * POST /api/user/upload-avatar
 * Upload user avatar to Vercel Blob
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const filename = `avatars/${user._id}-${timestamp}.${fileExtension}`;

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: true,
        allowOverwrite: true,
        // onUploadProgress: ({ loaded, percentage, total }) => {
        //   console.log("Bytes sent:", loaded);
        //   console.log("Total Bytes:", total);
        //   console.log("Progress:", percentage);
        // },
      });

      // Update user avatar URL
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { avatar: blob.url },
        { new: true, select: "-password" }
      );

      // Create activity log
      await createActivity({
        userId: user._id.toString(),
        type: "profile_updated",
        title: "Profile Picture Updated",
        message: "Your profile picture has been successfully updated.",
        category: "system",
        priority: "low",
      });

      return NextResponse.json({
        success: true,
        data: {
          avatar: blob.url,
          user: {
            id: updatedUser?._id,
            name: updatedUser?.name,
            email: updatedUser?.email,
            avatar: updatedUser?.avatar,
          },
        },
        message: "Avatar uploaded successfully",
      });
    } catch (uploadError) {
      console.error("Blob upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/upload-avatar
 * Remove user avatar
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Update user to remove avatar
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $unset: { avatar: 1 } },
      { new: true, select: "-password" }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: null,
        },
      },
      message: "Avatar removed successfully",
    });
  } catch (error) {
    console.error("Avatar removal error:", error);
    return NextResponse.json(
      { error: "Failed to remove avatar" },
      { status: 500 }
    );
  }
}
