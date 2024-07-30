export { Bat, Ball };


class Bat {
	constructor (height, width, color){
		this.height = height;
		this.width = 20;
		this.velocite = 10;
		const geometry = new THREE.BoxGeometry(this.width, this.height, 20);
		geometry.height = this.height;
		geometry.width = this.width;
		geometry.depth = 100;
		
		const material = new THREE.MeshStandardMaterial({color: color});
		this.mesh = new THREE.Mesh(geometry, material);
	}

	setSize(width) {
		const standardSize = 100;
		const ratio = (width * 10) / standardSize;
		this.height = width * 10;
		this.mesh.scale.set(1, ratio, 1);
	}

	setColor(color) {
		this.mesh.material.color.set(color);
	}

	setPosition(x, y)
	{
		this.x = x;
		this.y = y;
		// this.mesh.position.set(x, (-y - 50), 0);
		this.mesh.position.set(x, (-y - (this.height / 2)), 0);

	}

	updatePosition(x, y) {
		this.x = x;
		this.y = y;
		// this.mesh.position.set(this.x, (-this.y - 50), 0);
		this.mesh.position.set(x, (-y - (this.height / 2)), 0);
	}

	dispose(scene) {
		//console.log('Disposing bat');
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
	setVelocity(velocite) {
		this.velocite = velocite;
		this.vx = velocite;
		//console.log(`Setting bat velocity to ${velocite}`);
		this.vy = 0;
	}
}

class Ball {
	constructor (color, size) {
		this.color = color;
		this.size = size;
		this.velocite = 10;
		this.vx = this.velocite;
		this.vy = 0;
		this.fragments = [];

		const geometry = new THREE.SphereGeometry(this.size, this.size, 12);
		const material = new THREE.MeshStandardMaterial({color: color});
		this.mesh = new THREE.Mesh(geometry, material);

	}

	setColor(color) {
		this.color = color;
		this.mesh.material.color.set(color);
	}

	setVelocity(velocite) {
		this.velocite = velocite;
		this.vx = velocite;
		//console.log(`Setting ball velocity to ${velocite}`);
		this.vy = 0;
	}

	setPosition(x, y)
	{
		this.x = x;
		this.y = y;
		this.mesh.position.set(x, -y, 0);
	}

	updatePosition(x, y) {
		this.x = x;
		this.y = y;
		this.mesh.position.set(this.x, -this.y, 0);
	}

	destroyBall(scene) {
		this.fragments = createFragments(this.mesh.geometry, this.mesh.position, this.color);
		//console.log(`Destroying ball and creating ${this.fragments.length} fragments`);
		//console.log(`Ball position: ${this.mesh.position.x}, ${this.mesh.position.y}, ${this.mesh.position.z}`);
		this.fragments.forEach(fragment => {
			scene.add(fragment);
			//console.log(`Added fragment to scene at position: ${fragment.position.x}, ${fragment.position.y}, ${fragment.position.z}`);
		});
		scene.remove(this.mesh);
	}

	deleteFragments(scene) {
		this.fragments.forEach(fragment => {
			scene.remove(fragment);
			fragment.geometry.dispose();
			fragment.material.dispose();
		});
		this.fragments = [];
	}


	dispose(scene) {
		//console.log('Disposing ball');
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
};

function createFragments(geometry, ballPosition, color) {
    const fragments = [];
    const positionAttribute = geometry.getAttribute('position');
    const vertexCount = positionAttribute.count;

	// const step = vertexCount / 24;
	const step = 3;

    for (let i = 0; i < vertexCount; i += step) {
        const fragmentGeometry = new THREE.BufferGeometry();
		
		const vertices = new Float32Array(9);

		for (let j = 0; j < 3; j++) {
			const x = positionAttribute.getX(i + j);
            const y = positionAttribute.getY(i + j);
            const z = positionAttribute.getZ(i + j);

            vertices[j * 3] = isNaN(x) ? 0 : x;
            vertices[j * 3 + 1] = isNaN(y) ? 0 : y;
            vertices[j * 3 + 2] = isNaN(z) ? 0 : z;
		}

        fragmentGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		fragmentGeometry.computeBoundingSphere();
        const fragmentMaterial = new THREE.MeshBasicMaterial({ color: color });
        const fragmentMesh = new THREE.Mesh(fragmentGeometry, fragmentMaterial);

		// fragmentMesh.scale.set(2, 2, 2);
		fragmentMesh.position.copy(ballPosition);
		// fragmentMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
		// fragmentMesh.userData.life = 100;

        fragments.push(fragmentMesh);
    }
	//console.log(`Created ${fragments.length} fragments`);
    return fragments;
}

export function animateFragments(fragments) {
	if (fragments.length === 0) return;
    fragments.forEach(fragment => {
        fragment.position.x += (Math.random() - 0.5) * 5;
        fragment.position.y += (Math.random() - 0.5) * 5;
        fragment.position.z += (Math.random() - 0.5) * 5;
		//console.log(`Animating fragment to position: ${fragment.position.x}, ${fragment.position.y}, ${fragment.position.z}`);
    });
}