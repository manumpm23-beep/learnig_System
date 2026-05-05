def build_subject_tree(sections, progress_map):
    sorted_sections = sorted(sections, key=lambda s: s.orderIndex)
    
    global_videos = []
    tree = []

    for section in sorted_sections:
        sorted_videos = sorted(section.videos, key=lambda v: v.orderIndex)
        video_nodes = []
        for video in sorted_videos:
            is_completed = progress_map.get(video.id, False)
            node = {
                "id": video.id,
                "title": video.title,
                "description": video.description,
                "youtubeUrl": video.youtubeUrl,
                "orderIndex": video.orderIndex,
                "durationSeconds": video.durationSeconds,
                "isCompleted": is_completed,
                "locked": False
            }
            video_nodes.append(node)
            global_videos.append(node)
        
        tree.append({
            "id": section.id,
            "title": section.title,
            "orderIndex": section.orderIndex,
            "videos": video_nodes
        })

    for i in range(len(global_videos)):
        if i == 0:
            global_videos[i]["locked"] = False
        else:
            prev_completed = global_videos[i - 1]["isCompleted"]
            global_videos[i]["locked"] = not prev_completed

    return tree

def get_global_video_sequence(sections, progress_map):
    tree = build_subject_tree(sections, progress_map)
    global_videos = []
    for section in tree:
        global_videos.extend(section["videos"])
    return global_videos
