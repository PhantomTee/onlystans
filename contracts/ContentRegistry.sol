// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ContentRegistry {
    struct Video {
        string ipfsCid;
        string thumbnailCid;
        address payable creator;
        uint256 ratePerSecond;
        uint256 totalEarned;
        bool active;
    }

    mapping(bytes32 => Video) public videos;
    mapping(address => bytes32[]) public creatorVideos;

    event VideoRegistered(bytes32 indexed videoId, address creator, uint256 ratePerSecond);
    event EarningsUpdated(bytes32 indexed videoId, uint256 totalEarned);

    function registerVideo(
        bytes32 videoId,
        string calldata ipfsCid,
        string calldata thumbnailCid,
        uint256 ratePerSecond
    ) external {
        require(videos[videoId].creator == address(0), "Exists");
        videos[videoId] = Video(ipfsCid, thumbnailCid, payable(msg.sender), ratePerSecond, 0, true);
        creatorVideos[msg.sender].push(videoId);
        emit VideoRegistered(videoId, msg.sender, ratePerSecond);
    }

    function recordEarning(bytes32 videoId, uint256 amount) external {
        videos[videoId].totalEarned += amount;
        emit EarningsUpdated(videoId, videos[videoId].totalEarned);
    }

    function getCreatorVideos(address creator) external view returns (bytes32[] memory) {
        return creatorVideos[creator];
    }
}
