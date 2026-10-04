import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getTrashItemById, deleteTrashItem, recordAuditLog } from '@/lib/db/governance';
import { execute } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Owner and Developer can restore from Trash
  const auth = await requirePermission(request, 'restore_trash');
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await context.params;
    const trashId = parseInt(id, 10);

    const trashItem = await getTrashItemById(trashId);
    if (!trashItem) {
      return NextResponse.json({ error: 'Trash item not found' }, { status: 404 });
    }

    const data = JSON.parse(trashItem.entity_data);

    // Restore back to original table based on entity_type
    if (trashItem.entity_type === 'place') {
      await execute(
        `INSERT INTO places (id, name, description, short_description, location, province, category, lat, lng, image_url, gallery, tips, best_time, entry_fee, distance_km, rating, review_count, featured, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
        [
          data.id,
          data.name,
          data.description,
          data.short_description || '',
          data.location,
          data.province,
          data.category,
          data.lat,
          data.lng,
          data.image_url || '',
          data.gallery || '[]',
          data.tips || '',
          data.best_time || '',
          data.entry_fee || 'Free',
          data.distance_km || 0,
          data.rating || 0,
          data.review_count || 0,
          data.featured || 0,
          data.created_at || new Date().toISOString(),
        ]
      );
    } else if (trashItem.entity_type === 'review') {
      await execute(
        `INSERT INTO reviews (id, place_id, author, rating, comment, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE comment = VALUES(comment)`,
        [
          data.id,
          data.place_id,
          data.author,
          data.rating,
          data.comment,
          data.status || 'approved',
          data.created_at || new Date().toISOString(),
        ]
      );
    }

    // Delete from trash table
    await deleteTrashItem(trashId);

    // Record in audit log
    await recordAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      userRole: auth.user.role,
      action: 'restore_from_trash',
      entityType: trashItem.entity_type,
      entityId: trashItem.entity_id,
      details: `Restored ${trashItem.entity_type} #${trashItem.entity_id} from trash`,
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({
      success: true,
      message: `${trashItem.entity_type} #${trashItem.entity_id} restored successfully.`,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('POST /api/admin/trash/[id] error:', err);
    return NextResponse.json({ error: 'Failed to restore item from trash' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Purging a single item permanently is owner only
  const auth = await requirePermission(request, 'empty_trash');
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await context.params;
    const trashId = parseInt(id, 10);

    const trashItem = await getTrashItemById(trashId);
    if (!trashItem) {
      return NextResponse.json({ error: 'Trash item not found' }, { status: 404 });
    }

    await deleteTrashItem(trashId);

    await recordAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      userRole: auth.user.role,
      action: 'purge_trash_item',
      entityType: trashItem.entity_type,
      entityId: trashItem.entity_id,
      details: `Permanently purged ${trashItem.entity_type} #${trashItem.entity_id} from trash`,
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({
      success: true,
      message: `Trash item #${trashId} permanently purged.`,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('DELETE /api/admin/trash/[id] error:', err);
    return NextResponse.json({ error: 'Failed to purge trash item' }, { status: 500 });
  }
}
